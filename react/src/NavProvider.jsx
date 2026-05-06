import {createContext, useContext, useState} from "react";

const NavContext = createContext(null);

export function NavProvider({children}){
    const [isNavOpen, setIsNavOpen] = useState(true);
    const toggleNav = () => setIsNavOpen(prev => !prev);

    return (
        <NavContext.Provider value={{isNavOpen, toggleNav}}>
            {children}
        </NavContext.Provider>
    )
}

export function useNav(){
    const context = useContext(NavContext);
    if (!context) {
        throw new Error("useNav must be used within a NavProvider.");
    }
    return context;
}