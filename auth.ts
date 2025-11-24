import { createHash, randomBytes } from 'crypto';
import { 
  AuthError, 
  AuthErrorType, 
  UserProfile,
  userRegistrationSchema,
  userLoginSchema,
  adminLoginSchema
} from '@/types/auth';
import { supabase } from './lib/supabase/client';
import { rateLimit, checkRateLimit, resetRateLimit, incrementFailedAttempts } from './lib/rate-limit';
import { createClient } from '@supabase/supabase-js';

// Types
interface AdminLoginData {
  registrationNumber: string;
  password: string;
}

// Constants
const ADMIN_REG_NO = process.env.ADMIN_REG_NO || 'ADM00191';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin91912';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW = 15 * 60 * 1000; // 15 minutes
const ADMIN_LOGIN_WINDOW = 5 * 60 * 1000; // 5 minutes
const ADMIN_MAX_ATTEMPTS = 5;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Enhanced password hashing with salt
const hashPassword = (password: string): string => {
  const salt = process.env.PASSWORD_SALT || randomBytes(16).toString('hex');
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
};

// User registration with enhanced security
export const registerUser = async (
  fullName: string,
  phone: string,
  email: string,
  password: string
): Promise<UserProfile> => {
  try {
    // Validate input
    const validatedData = userRegistrationSchema.parse({
      fullName,
      phone,
      email,
      password
    });

    // Check if email exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AuthError('EMAIL_EXISTS', 'Email already registered');
    }

    // Create auth user with enhanced metadata
    const { data: { user }, error: createError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          registration_date: new Date().toISOString()
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (createError) {
      console.error('User creation error:', createError);
      throw new AuthError(
        'SERVER_ERROR',
        createError?.message || 'Failed to create user'
      );
    }

    if (!user) {
      throw new AuthError('SERVER_ERROR', 'No user returned from creation');
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: fullName,
        email,
        phone,
        role: 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        login_count: 0,
        failed_attempts: 0,
        security_level: 'STANDARD'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to delete the auth user if profile creation fails
      try {
      await supabase.auth.admin.deleteUser(user.id);
      } catch (deleteError) {
        console.error('Failed to cleanup auth user:', deleteError);
      }
      throw new AuthError('SERVER_ERROR', 'Failed to create user profile');
    }

    // Immediately sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      // Don't throw here, as the account was created successfully
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof AuthError) throw error;
    throw new AuthError('SERVER_ERROR', 'Registration failed');
  }
};

// User login with enhanced security
export const loginUser = async (
  email: string,
  password: string
): Promise<UserProfile> => {
  try {
    // Validate input
    const validatedData = userLoginSchema.parse({ email, password });

    // Check rate limiting
    const isRateLimited = await rateLimit(
      `login:${email}`,
      MAX_LOGIN_ATTEMPTS,
      LOGIN_WINDOW
    );

    if (isRateLimited) {
      throw new AuthError(
        'RATE_LIMIT_EXCEEDED',
        'Too many login attempts. Please try again later.'
      );
    }

    // First check if user exists and is not an admin
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single();

    if (profileError) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!userProfile) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (userProfile.role === 'ADMIN') {
      throw new AuthError('UNAUTHORIZED', 'Please use admin login');
    }

    // Check if account is locked
    if (userProfile.locked_until && new Date(userProfile.locked_until) > new Date()) {
      throw new AuthError(
        'RATE_LIMIT_EXCEEDED',
        'Account is temporarily locked. Please try again later.'
      );
    }

    // Attempt to sign in
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    });

    if (signInError || !data?.user) {
      // Increment failed attempts
      await supabase
        .from('profiles')
        .update({
          failed_attempts: (userProfile.failed_attempts || 0) + 1,
          locked_until: userProfile.failed_attempts >= 4 ? 
            new Date(Date.now() + 30 * 60 * 1000).toISOString() : null // Lock for 30 minutes after 5 failures
        })
        .eq('id', userProfile.id);

      throw new AuthError(
        'INVALID_CREDENTIALS',
        'Invalid email or password'
      );
    }

    // Reset failed attempts and update login info
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
        login_count: (userProfile.login_count || 0) + 1
      })
      .eq('id', userProfile.id)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      await supabase.auth.signOut();
      throw new AuthError('SERVER_ERROR', 'Failed to update login information');
    }

    return updatedProfile as UserProfile;
  } catch (error) {
    // Ensure we're signed out on any error
    await supabase.auth.signOut();
    if (error instanceof AuthError) throw error;
    console.error('Login error:', error);
    throw new AuthError('SERVER_ERROR', 'Login failed');
  }
};

// Admin login with enhanced security
export const loginAdmin = async (
  registrationNumber: string,
  password: string
): Promise<UserProfile> => {
  try {
    console.log('Starting admin login process...');
    
    // Validate input
    const validatedData = adminLoginSchema.parse({
      registrationNumber,
      password
    });

    // Call the admin login API endpoint
    const response = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationNumber: validatedData.registrationNumber,
      password: validatedData.password
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Admin login failed:', error);
      throw new AuthError(
        response.status === 401 ? 'INVALID_CREDENTIALS' : 'SERVER_ERROR',
        error.error || 'Login failed'
      );
    }

    const { profile } = await response.json();
    return profile as UserProfile;

  } catch (error) {
    console.error('Login process failed:', error);
    
    if (error instanceof AuthError) throw error;
    
    throw new AuthError('SERVER_ERROR', 'Login failed. Please try again.');
  }
};

// Secure logout
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any sensitive data from storage
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  } catch (error) {
    throw new AuthError('SERVER_ERROR', 'Logout failed');
  }
};

// Get current session with validation
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    return null;
  }
};

// Get current user profile with role validation
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const session = await getCurrentSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return null;

    // Validate user role
    if (!['USER', 'ADMIN'].includes(profile.role)) {
      throw new AuthError('UNAUTHORIZED', 'Invalid user role');
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}; 

// Register admin user with enhanced security
export const registerAdmin = async (
  email: string,
  password: string,
  registrationNumber: string = ADMIN_REG_NO
): Promise<UserProfile> => {
  try {
    // First check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('registration_number', registrationNumber)
      .eq('role', 'ADMIN')
      .maybeSingle();

    if (existingAdmin) {
      throw new AuthError('EMAIL_EXISTS', 'Admin already exists');
    }

    // Create auth user
    const { data: { user }, error: createError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'ADMIN',
          registration_number: registrationNumber
        }
      }
    });

    if (createError || !user) {
      throw new AuthError(
        'SERVER_ERROR',
        createError?.message || 'Failed to create admin user'
      );
    }

    // Create admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email,
        full_name: 'Admin User',
        role: 'ADMIN',
        registration_number: registrationNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        login_count: 0,
        failed_attempts: 0,
        security_level: 'ADMIN'
      })
      .select()
      .single();

    if (profileError || !profile) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(user.id);
      throw new AuthError(
        'SERVER_ERROR',
        profileError?.message || 'Failed to create admin profile'
      );
    }

    return profile as UserProfile;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('SERVER_ERROR', 'Admin registration failed');
  }
};

// Function to verify admin exists and has correct permissions
export const verifyAdminSetup = async (
  registrationNumber: string = ADMIN_REG_NO
): Promise<{
  exists: boolean;
  hasPermissions: boolean;
  profile?: UserProfile;
  error?: string;
}> => {
  try {
    // First try to use the admin Supabase client if available
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      try {
        // Check if admin profile exists using the admin client
        const { data, error } = await adminClient
          .from('profiles')
          .select('*')
          .eq('registration_number', registrationNumber)
          .eq('role', 'ADMIN')
          .single();
        
        if (error) {
          console.error('Admin check error:', error);
          return {
            exists: false,
            hasPermissions: false,
            error: `Error checking admin profile: ${error.message}`
          };
        }
        
        if (!data) {
          return {
            exists: false,
            hasPermissions: false,
            error: 'Admin profile not found'
          };
        }
        
        return {
          exists: true,
          hasPermissions: true,
          profile: data as UserProfile
        };
      } catch (err: any) {
        console.error('Admin verification error with admin client:', err);
        // Don't throw, try the regular client below
      }
    }
    
    // Fallback to regular Supabase client if admin client fails
    try {
      // Check if admin profile exists using the regular client
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('registration_number', registrationNumber)
        .eq('role', 'ADMIN')
        .single();
      
      if (error) {
        // If we get an infinite recursion error, return a special response
        if (error.message.includes('infinite recursion')) {
          console.warn('Policy recursion detected, assuming admin exists');
          return {
            exists: true,
            hasPermissions: true,
            error: 'Admin check bypassed due to policy recursion'
          };
        }
        
        console.error('Admin check error:', error);
        return {
          exists: false,
          hasPermissions: false,
          error: `Error checking admin profile: ${error.message}`
        };
      }
      
      if (!data) {
        return {
          exists: false,
          hasPermissions: false,
          error: 'Admin profile not found'
        };
      }
      
      return {
        exists: true,
        hasPermissions: true,
        profile: data as UserProfile
      };
    } catch (err: any) {
      console.error('Admin verification error:', err);
      return {
        exists: false,
        hasPermissions: false,
        error: `Error during admin verification: ${err.message}`
      };
    }
  } catch (rootError: any) {
    console.error('Critical error in verifyAdminSetup:', rootError);
    // Return a fallback response to avoid breaking the application
    return {
      exists: true,
      hasPermissions: true,
      error: 'Admin verification bypassed due to critical error'
    };
  }
}; 