import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

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
export const createProject = async({item,visibility='private'}:CreateProjectParams): Promise<DesignItem | null | undefined> =>{
    if(!PUTER_WORKER_URL){
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch')
        return null;
    }
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
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project: payload,
                visibility
            })
        })
        // console.log(response)

        if(!response.ok){
            console.error('Failed to save the project', await response.text())
            return null;
        }

        // singular data so not an array of DesignItem
        const data = (await response.json()) as {project?: DesignItem | null}
        return data?.project ?? null;
    } catch (error) {
        console.error('Failed to save project',error)
        return null;
    }
}

export const getProjects = async() =>{
    if(!PUTER_WORKER_URL){
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch')
        return []
    }
    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`,{
            method: 'GET'
        })

        if(!response.ok){
            console.error('Failed to fetch history', await response.text())
            return []
        }

        const data = (await response.json()) as {projects?:DesignItem[] | null}
        return Array.isArray(data?.projects) ? data.projects : []
    } catch (error) {
        console.error('Failed to get projects',error)
        return []
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};