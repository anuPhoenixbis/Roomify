import puter from "@heyputer/puter.js";

// to sign in the user
export const signIn = async()=> await puter.auth.signIn()

// to signOut the user
export const signOut = async()=> await puter.auth.signOut()

// to get the current user
export const getCurrentUser = async() => {
    try {
        return await puter.auth.getUser()
    } catch (error) {
        return null;
    }
}
