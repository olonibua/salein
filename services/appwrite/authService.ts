import { Client, Account, ID } from 'appwrite';

// Initialize the Appwrite client
if (
  !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
) {
  throw new Error("Appwrite environment variables are not defined");
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
const account = new Account(client);

export interface UserSession {
    userId: string;
    name: string;
    email: string;
    isLoggedIn: boolean;
}

export const authService = {
    // Create a new user account
    async createAccount(email: string, password: string, name: string): Promise<UserSession> {
        try {
            const user = await account.create(
                ID.unique(),
                email,
                password,
                name
            );
            
            // Log in the user immediately after account creation
            await this.login(email, password);
            
            return {
                userId: user.$id,
                name: user.name,
                email: user.email,
                isLoggedIn: true
            };
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    },
    
    // Login user
    async login(email: string, password: string): Promise<UserSession> {
        try {
            const session = await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            return {
                userId: user.$id,
                name: user.name,
                email: user.email,
                isLoggedIn: true
            };
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },
    
    // Logout user
    async logout(): Promise<void> {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },
    
    // Get current session
    async getCurrentUser(): Promise<UserSession | null> {
        try {
            const user = await account.get();
            return {
                userId: user.$id,
                name: user.name,
                email: user.email,
                isLoggedIn: true
            };
        } catch (error) {
            return null; // User is not logged in
        }
    }
}; 