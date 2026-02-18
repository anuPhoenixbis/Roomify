import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";

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

// to create projects that are shown in the projects section of the hero
// here we store the projects data to the puter KV db
export const createProject = async({item}:CreateProjectParams): Promise<DesignItem | null | undefined> =>{
    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig()//get the hosting subdomain
    // this is the source image which we uploaded
    const hostedSource = projectId ? 
        await uploadImageToHosting({
            hosting,
            url: item.sourceImage,
            projectId,
            label: 'source'
        }) : null
    
    // this is the images we will get from the AI corresponding to the uploaded images
    const hostedRender = projectId && item.renderedImage ? 
        await uploadImageToHosting({
            hosting,
            url: item.renderedImage,
            projectId,
            label: 'rendered'
        }) : null
    
        // if hostedSource the url then return it or check if the image is hosted then return the image's url otherwise empty string
    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? 
        item.sourceImage : ''
    )

    if(!resolvedSource){
        console.warn('Failed to host source image, skipping save.')
        return null;
    }

    const resolvedRender = hostedRender?.url ?
        hostedRender.url
        : item.renderedImage && isHostedUrl(item.renderedImage) ?
            item.renderedImage : undefined;
    
    // fetching values from the item 
    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item

    // payload values are passed on and resolved image of both source and render
    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender
    }
    try {
        // calling the puter worker to store the project in kv db

        return payload
    } catch (error) {
        console.error('Failed to save project',error)
        return null;
    }
}