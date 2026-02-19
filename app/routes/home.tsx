import Navbar from "components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUpIcon, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "components/ui/Button";
import Upload from "components/Upload";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate()
  const [projects,setProjects] = useState<DesignItem[]>([])
  const isCreatingProjectRef = useRef(false)

  const handleUploadComplete = async(bases64Data:string) =>{
    if(isCreatingProjectRef.current) return false;
    isCreatingProjectRef.current = true
    try {
        
        // on completion of the upload we grab the date make the uuid for the image and pass it down to the visualizer route
        const newId = Date.now().toString()
        const name = `Residence ${newId}`
    
        // new item that will be passed down to the visualizer page
        const newItem =  {
          id:newId,
          name,
          sourceImage: bases64Data,
          renderedImage: undefined,
          timestamp: Date.now()
        }
        const saved = await createProject({
          item: newItem,
          visibility: 'private'
        })
        if(!saved) {
          console.error('Failed to create project'); 
          return false;
        }
    
        setProjects((prev=>[saved,...prev]))
    
        navigate(`/visualizer/${newId}`,{
          // passing down these state values to the visualizer page
          state:{
            initialImage: saved.sourceImage,
            initialRendered: saved.renderedImage || null,
            name
          }
        })
        return true
    }finally{
      isCreatingProjectRef.current = false;
    }
  }

  useEffect(()=>{
    const fetchProjects = async()=>{
      const items = await getProjects();
      setProjects(items)
    }
    fetchProjects()
  },[])

  return <div className="home">
    <Navbar/>

    {/* hero section */}
    <section className="hero">
      <div className="announce">
        <div className="dot">
          <div className="pulse"></div>
        </div>
        <p>Introducing Roomify</p>
      </div>
      <h1>Build beautiful spaces at the speed of thought with Roomify</h1>
      <p className="subtitle">Roomify is an AI-first design environment
        that helps you visualize, render and ship architectural projects faster than ever. 
      </p>
      <div className="actions">
        <a href="#upload" className="cta">
          Start Building<ArrowRight className="icon"/>
        </a>
        <Button variant="outline" size="lg" className="demo">Watch Demo</Button>
      </div>
      <div className="upload-shell" id="upload">
        <div className="grid-overlay" />
        <div className="upload-card">
          <div className="upload-head">
            <div className="upload-icon">
              <Layers className="icon" />
            </div>
            <h3>Upload your floor plan</h3>
            <p>Supports JPG, PNG ,formats up to 50MB</p>
          </div>
          {/* upload section */}
          <Upload 
              onComplete={handleUploadComplete}
            // onComplete={(base64Data)=>{
              // console.log("upload complete:",base64Data)
              // here we can grab the file ; we must redirect the user to the visualizer page
            // }}
          />
        </div>
      </div>

    </section>
    {/* projects section */}
    <section className="projects">
      <div className="section-inner">
        <div className="section-head">
          <div className="copy">
            <h2>Projects</h2>
            <p>Your latest work and shared community projects, all in one place.</p>
          </div>
        </div>
        <div className="projects-grid">
          {projects.map(({id,name,renderedImage,sourceImage,timestamp})=>(
            <div className="project-card group" key={id} onClick={()=>navigate(`/visualizer/${id}`)}>
              <div className="preview">
                <img src={renderedImage || sourceImage} 
                alt="Project" 
                />
                <div className="badge">
                  <span>Community</span>
                </div>
              </div>
              <div className="card-body">
                <div>
                  <h3>{name}</h3>
                  <div className="meta">
                    <Clock size={12}/>
                    <span>{new Date(timestamp).toLocaleDateString()}</span>
                    <span>By John Doe</span>
                  </div>
                </div>
                <div className="arrow">
                  <ArrowUpRight size={18}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>;
}

/*
Puter handles everything in the client-side and there is no involvement of the sever-side handling
All the server-side processes is handled by the Puter itself
1. Key-Value : to store data of the user in place of entire db setups
2. FileSystem+Hosting : to store images in form of files and giving urls of those images via hosting just like we setup buckets in supabase for files
3.Workers : When handling on the client-side there might be security breaches so, the puter have workers to ensure auth/security between client and server 
 */
