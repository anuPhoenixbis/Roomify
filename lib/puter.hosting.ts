import puter from "@heyputer/puter.js";
import { createHostingSlug, fetchBlobFromUrl, getHostedUrl, getImageExtension, HOSTING_CONFIG_KEY, imageUrlToPngBlob, isHostedUrl } from "./utils";

// here we will handle the image hosting
// type HostingConfig = {subdomain:string};//holds the subdomain string
// type HostedAsset = {url:string}//holds the final string of the image url
// already defined in the type.d.ts

// get the subdomain or create a new one for hosting the images
export const getOrCreateHostingConfig = async() : Promise<HostingConfig | null> =>{
    // to check for existing domain
    const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;

    // if the subdomain of the existing hosting config exists then we return the subdomain
    if(existing?.subdomain) return {subdomain : existing.subdomain}

    // if it DNE then we create a new subdomain
    const subdomain = createHostingSlug()

    try {
        const created = await puter.hosting.create(subdomain,'.')//making the subdomain room images in the current dir
        const record = {subdomain:created.subdomain}
        return record;//returning the created subdomain
    } catch (error) {
        console.warn(`Could not find subdomain: ${error}`)
        return null;
    }
}

// to upload images to the hosting rooms
export const uploadImageToHosting = async({
    hosting,
    url,
    projectId,
    label,
}:StoreHostedImageParams): Promise<HostedAsset | null> =>{
    if(!hosting || !url) return null;
    if(isHostedUrl(url)) return {url};//if the url is already hosted then we return the url 

    try {
        // check if the image url is resolved  or not
        // if already resolved then convert the image url to a png blob
        // if not resolved then fetch the blob of the image url and resolve it
        const resolved = label === "rendered" ? 
        await imageUrlToPngBlob(url)
        .then((blob)=>blob ? {blob,contentType : 'image/png'}: null)
        : await fetchBlobFromUrl(url)

        if(!resolved) return null;//if still not resolved then return null

        const contentType = resolved.contentType || resolved.blob.type || '';
        const ext = getImageExtension(contentType,url)//get the image extension
        const dir = `projects/${projectId}`
        const filePath = `${dir}/${label}.${ext}`//finally getting the entire image url

        // creating a new file using the resolved image blob and image label and extension
        const uploadFile = new File([resolved.blob],`${label}.${ext}`,
            {type:contentType}
        )

        // create the dir if it already DNE and then inside the specified filePath we write the data string of the uploaded image
        await puter.fs.mkdir(dir,{createMissingParents: true})
        await puter.fs.write(filePath,uploadFile);
        // after uploading the values a hosted image url is generated

        // fetching the hosted image url
        const hostedUrl = getHostedUrl({
            subdomain: hosting.subdomain
        }, filePath)

        return hostedUrl ? {url:hostedUrl} : null;
    } catch (error) {
        console.warn(`Failed to store the hosted image: ${error}`)
        return null;
    }
}