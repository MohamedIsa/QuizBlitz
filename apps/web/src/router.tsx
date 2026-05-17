import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/router/AuthGuard'
import { LoginPage } from '@/pages/login/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8">
    <h1 className="font-display text-2xl font-bold text-ink">{name}</h1>
    <p className="mt-2 text-ink-muted">Coming soon.</p>
  </div>
)

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  ...(import.meta.env.DEV
    ? [{
        path: '/__brand-test',
        lazy: async () => {
          const { BrandTestPage } = await import('@/pages/__brand-test/BrandTestPage')
          return { Component: BrandTestPage }
        },
      }]
    : []),
  {
    element: <AuthGuard />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/quizzes', element: <Placeholder name="Quiz Library" /> },
      { path: '/quizzes/new', element: <Placeholder name="New Quiz" /> },
      { path: '/quizzes/:id/edit', element: <Placeholder name="Edit Quiz" /> },
    ],
  },
])
