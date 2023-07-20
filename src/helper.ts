import { useEffect } from "react";

export function useMountLog(name: string) {

  useEffect(() => {
    console.log(`Mount: ${name}`)
    return () => { console.log(`Unmount: ${name}`) }
  }, [])

}


export function useRenderLog(name: string) {

    useEffect(() => { console.count(`Render: ${name}`) })
  
  }