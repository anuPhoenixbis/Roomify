import Button from 'components/ui/Button'
import { generate3DView } from 'lib/ai.actions'
import { createProject, getProjectById } from 'lib/puter.action'
import { Box, Download, RefreshCcw, Share2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router'
import { WhatsappShareButton, TelegramShareButton, PinterestShareButton, WhatsappIcon, TelegramIcon, PinterestIcon } from 'react-share'

function visualizerId() {
    const {id} = useParams();
    const navigate = useNavigate()
    const {userId} = useOutletContext<AuthContext>()
    const [project,setProject] = useState<DesignItem | null>(null)
    const [isProjectLoading,setIsProjectLoading] = useState(false)

    const hasInitialGenerated = useRef(false)//to check if the image is generated or not

    const [isProcessing,setIsProcessing] = useState(false)
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)

    const handleBack = () =>navigate('/')

    const handleExport = async () => {
        if (!currentImage) return;

        try {
            // fetch the image as a blob
            const response = await fetch(currentImage);
            const blob = await response.blob();

            // create a temporary URL for the blob
            const url = URL.createObjectURL(blob);

            // create an anchor element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project?.name || `Residence-${id}`}-render.png`;
            document.body.appendChild(link);
            link.click();

            // cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export image:', error);
        }
    };

    const handleShare = () => {
        setIsShareMenuOpen(!isShareMenuOpen);
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = `Check out my Roomify design: ${project?.name || `Residence ${id}`}`;

    const runGeneration = async(item:DesignItem) =>{
        if(!id || !item.sourceImage) return;

        try {
            // manual loading becoz image generations take time
            setIsProcessing(true);
            const result = await generate3DView({sourceImage: item.sourceImage})

            if(result.renderedImage){
                setCurrentImage(result.renderedImage)

                // update the project with the rendered image
                const updatedItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp:Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false
                }

                const saved = await createProject({item:updatedItem,visibility:"private"})

                if(saved){
                    setProject(saved)
                    setCurrentImage(saved.renderedImage || result.renderedImage)
                }
            }
        } catch (error) {
            console.error('Generation failed',error)
        }finally{
            // closed loading no matter what
            setIsProcessing(false)
        }
    }

    // dummy generations
    // useEffect(()=>{
    //     if(!initialImage || hasInitialGenerated.current) return;
    //     if(initialRender){
    //         setCurrentImage(initialRender);
    //         hasInitialGenerated.current = true;
    //         return;
    //     }
    //     hasInitialGenerated.current = true;
    //     runGeneration()
    // },[initialImage,initialRender])//when either of them change then we run the image generation

    useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);



  return (
    <div className="visualizer">
        {/* top nav bar */}
        <nav className="topbar">
            <div className="brand">
                <Box className='logo'/>
            <span className='name'>Roomify</span>
            </div>
            <Button className='exit' variant='ghost' size="sm" onClick={handleBack}>
                <X className='icon' /> Exit Editor
            </Button>
        </nav>

        {/* actual visualizer */}
        <section className="content">
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-meta">
                        <p>Project</p>
                        <h2>{project?.name || `Residence ${id}`}</h2>
                        <p className='note'>Created by You</p>
                    </div>
                    <div className="panel-actions">
                        <Button 
                            size="sm"
                            onClick={handleExport}
                            className='export'
                            disabled={!currentImage}>
                                <Download className='w-4 h-4 mr-2'/>Export
                            </Button>
                        <div className="relative">
                            <Button 
                                size="sm" 
                                onClick={handleShare}
                                className='share'>
                                <Share2 className='w-4 h-4 mr-2'/>
                                Share
                            </Button>
                            {isShareMenuOpen && (
                                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-3 z-10 flex gap-2">
                                    <WhatsappShareButton 
                                        url={shareUrl}
                                        title={shareTitle}
                                        separator=" - "
                                        className="share-btn">
                                        <span className="text-sm">
                                            <WhatsappIcon className='h-10 w-10 rounded'/>
                                        </span>
                                    </WhatsappShareButton>
                                    <TelegramShareButton 
                                        url={shareUrl}
                                        title={shareTitle}
                                        className="share-btn">
                                        <span className="text-sm">
                                            <TelegramIcon className='h-10 w-10 rounded'/>
                                        </span>
                                    </TelegramShareButton>
                                    <PinterestShareButton 
                                        url={shareUrl}
                                        media={currentImage || ''}
                                        description={shareTitle}
                                        className="share-btn">
                                        <span className="text-sm">
                                            <PinterestIcon className='h-10 w-10 rounded' />
                                        </span>
                                    </PinterestShareButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
                    {currentImage ? (
                        <img src={currentImage} alt="AI Render" className='render-img' />
                    ):(
                        <div className="render-placeholder">
                            {project?.sourceImage && (
                                <img src={project?.sourceImage} alt="Original" className="render-fallback" />
                            )}
                        </div>
                    )}
                    {isProcessing && (
                        <div className="render-overlay">
                            <div className="rendering-card">
                                <RefreshCcw className='spinner' />
                                <span className="title">Rendering...</span>
                                <span className="subtitle">Generating your 3D visualization</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* comparison slider */}
            <div className="panel compare">
                <div className="panel-header">
                    <div className="panel-meta">
                        <p>Comparison</p>
                        <h3>Before and After</h3>
                    </div>
                    <div className="hint">Drag to Compare</div>
                </div>
                <div className="compare-stage">
                    {project?.sourceImage && currentImage ? (
                        <ReactCompareSlider 
                            defaultValue={50}
                            style={{width:'100%',height:'auto'}}
                            itemOne= {
                                <ReactCompareSliderImage 
                                    src={project?.sourceImage} 
                                    alt='before'
                                    className='compare-img'/>
                            }
                            itemTwo= {
                                <ReactCompareSliderImage
                                    src={currentImage ?? project?.renderedImage ?? undefined} 
                                    alt="after"
                                    className='compare-img' />
                            }
                            />
                    ):(
                        <div className="compare-fallback">
                            {project?.sourceImage && (
                                <img src={project.sourceImage} alt="Before" className='compare-img' />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    </div>
  )
}

export default visualizerId