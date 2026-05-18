import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/router/AuthGuard'
import { HostLayout } from '@/components/layout/HostLayout'
import { LoginPage } from '@/pages/login/LoginPage'
import { AuthCallbackPage } from '@/pages/auth-callback/AuthCallbackPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { QuizLibraryPage } from '@/pages/quizzes/QuizLibraryPage'
import { QuizEditorPage } from '@/pages/quizzes/QuizEditorPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
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
      {
        element: <HostLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/quizzes', element: <QuizLibraryPage /> },
          { path: '/quizzes/new', element: <QuizEditorPage /> },
          { path: '/quizzes/:id/edit', element: <QuizEditorPage /> },
        ],
      },
    ],
  },
])
