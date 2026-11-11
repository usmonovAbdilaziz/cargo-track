import { Navigate, Route, Routes } from "react-router-dom"
import { routes } from "../routes"

export const Bodies = () => {
    return(
         <main className="min-w-0 flex-1 p-3 md:p-6">
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </main>
    )
}
