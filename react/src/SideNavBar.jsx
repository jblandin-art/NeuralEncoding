import { NavLink } from "react-router-dom";

const baseLinkClass =
  "flex items-center gap-4 px-4 py-3 rounded font-['Manrope'] text-sm uppercase tracking-wider transition-all duration-200 ease-in-out cursor-pointer active:scale-95";

function linkClass(isActive) {
  if (isActive) {
    return `${baseLinkClass} text-[#00E5FF] border-l-2 border-[#00E5FF] bg-[#1c2028]`;
  }

  return `${baseLinkClass} text-[#ecedf6] opacity-50 hover:opacity-100 hover:bg-[#1c2028]`;
}

export default function SideNavBar() {
  return (
    <nav className="hidden md:flex flex-col py-8 gap-4 border-r border-[#ecedf6]/5 h-screen w-64 bg-[#161a21] shrink-0 z-20">
      <div className="px-6 mb-8 flex flex-col gap-2">
        <span className="font-['Space_Grotesk'] font-bold text-[#00E5FF] text-xl tracking-widest uppercase">
          NEURAL_CORE v1.0
        </span>
      </div>
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
          <img
            alt="User Neural Profile"
            className="w-full h-full object-cover"
            data-alt="close up of a professional individual with subtle high tech lighting"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtRlqRwXq4vlzXj9eKZMbuSp7RvxYVSzXvJjHKCmSxBHQ8KKp44ta6r83I9bUKY2-RtjQPSzxzFGLwTDmbtxE791M5biprLM5-DIgaOmOVsRlcygN5MDV2pB9BW34c6H9O5DLLLCmTNrHyzikII4LUcRDukAkmiC4v6CXYpwuT15enWtaYeCYbbngO-0TwoFnBJ1K1Llw8sqWwqXhq6Y264NktxI9oVmlc0TygOaXwOZxBdJXGJ55EbuVUuF6kB3BP-VNNOjHvhto"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-on-surface text-sm">Operator_01</span>
          <span className="font-body text-secondary text-xs">Sync: 98.4%</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 px-4 gap-2">
        <NavLink className={({ isActive }) => linkClass(isActive)} to="/" end>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                neurology
              </span>
              <span>Neural Feed</span>
            </>
          )}
        </NavLink>
          {
        <button
          type="button"
          className={`${baseLinkClass} text-[#ecedf6] opacity-50 hover:opacity-100 hover:bg-[#1c2028] text-left`}
          aria-disabled="true"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            insights
          </span>
          <span>ML Insights</span>
        </button>
        }

        <button
          type="button"
          className={`${baseLinkClass} text-[#ecedf6] opacity-50 hover:opacity-100 hover:bg-[#1c2028] text-left`}
          aria-disabled="true"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            hub
          </span>
          <span>Web3 Analytics</span>
        </button>

        <NavLink className={({ isActive }) => linkClass(isActive)} to="/system-logs">
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                terminal
              </span>
              <span>System Logs</span>
            </>
          )}
        </NavLink>
      </div>
      <div className="px-6 mt-auto">
        <button className="w-full py-3 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-sm tracking-wider rounded-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
          NEW SESSION
        </button>
      </div>
    </nav>
  );
}
