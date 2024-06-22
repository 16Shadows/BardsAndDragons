import { useEffect, useRef } from "react";


function useScroll(element: Element | Document, callback: (ev: Event) => void) {
    const lastCallback = useRef<(ev: Event) => void>();

    useEffect(() => {
        if (lastCallback.current)
            element.removeEventListener('scroll', lastCallback.current);
        
        lastCallback.current = callback;
        
        element.addEventListener('scroll', callback);
    }, [element, callback]);
}

export default useScroll;