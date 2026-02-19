const PROJECT_PREFIX="roomify_project_";//used in the key formation

// custom jsonError method
const jsonError = (status,message,extra={})=>{
    return new Response(JSON.stringify({error:message,...extra}),{
        status,
        headers:{
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin':"*"
        }
    })
}

const getUserId = async(userPuter) =>{
    try {
        // get the userId of the user via puter
        const user = await userPuter.auth.getUser()
        return user?.uuid || null
    } catch (error) {
        return null;
    }
}

// post req of the router to save the current project, these are called workers in puter
router.post('/api/projects/save',async({request,user})=>{
    try {
        const userPuter = user.puter;//get the puter user
        if(!userPuter) return jsonError(401,'Authentication Failed')

            // get the user's project and body(other data)
        const body = await request.json()
        const project = body?.project;
        const visibility = body?.visibility ?? 'private'

        // project check
        if(!project?.id || !project?.sourceImage) return jsonError(400,'Project Id and source image are both required')

            // form the payload with the project details along with updatedAt
        const payload = {
            ...project,
            visibility,
            isPublic:visibility==='public',
            updatedAt: new Date().toISOString()
        }

        const userId = await getUserId(userPuter)
        if(!userId) return jsonError(401,'Authentication Failed')

        // we will store it under kv db so we gotta craft a key first
        const key = `${PROJECT_PREFIX}${project.id}`
        await userPuter.kv.set(key,payload)

        // saving the values
        return {saved:true, id:project.id,project:payload}
    } catch (error) {
        return jsonError(500,'Failed to save project',{message:error.message || 'Unknown error'})
    }
})

// GET endpoint to list all projects for the authenticated user
router.get('/api/projects/list',async({request,user})=>{
    try {
        const userPuter = user.puter;
        if(!userPuter) return jsonError(401,'Authentication Failed')

        // fetch all keys from KV store that start with PROJECT_PREFIX
        const allKeys = await userPuter.kv.list()
        const projectKeys = allKeys.filter(key => key.startsWith(PROJECT_PREFIX))

        // fetch all projects using their keys
        const projects = []
        for (const key of projectKeys) {
            const project = await userPuter.kv.get(key)
            if (project) {
                projects.push({
                    ...project,
                    isPublic:project.isPublic ?? project.visibility === 'public'
                })
            }
        }

        return { projects }
    } catch (error) {
        return jsonError(500,'Failed to list projects',{message:error.message || 'Unknown error'})
    }
})

// GET endpoint to fetch a specific project by ID
router.get('/api/projects/get',async({request,user})=>{
    try {
        const userPuter = user.puter;
        if(!userPuter) return jsonError(401,'Authentication Failed')

        // extract project ID from search params
        const url = new URL(request.url)
        const projectId = url.searchParams.get('id')

        if(!projectId) return jsonError(400,'Project ID is required')

        // fetch the project from KV store using prefixed key
        const key = `${PROJECT_PREFIX}${projectId}`
        const project = await userPuter.kv.get(key)

        if(!project) return jsonError(404,'Project not found')

        return { project }
    } catch (error) {
        return jsonError(500,'Failed to fetch project',{message:error.message || 'Unknown error'})
    }
})

