'use client';

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cartMigrated, setCartMigrated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get user from server-side API (more reliable)
    fetch('/api/auth/session')
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Not authenticated')
      })
      .then(data => {
        setUser(data.user)
        // Migrate cart if user is logged in and cart hasn't been migrated yet
        if (data.user?.id && !cartMigrated) {
          console.log('🛒 [NAVBAR] Migrating cart for user:', data.user.id)
          setCartMigrated(true)
          fetch('/api/cart/migrate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' }
          }).catch(error => {
            console.warn('Error migrating cart:', error)
            setCartMigrated(false) // Reset on error
          })
        }
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })

    // Listen for auth changes and refresh user data
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
          // Re-fetch user data from server
          try {
            const response = await fetch('/api/auth/session')
            if (response.ok) {
              const data = await response.json()
              setUser(data.user)
              // Migrate cart for new logins (if not already migrated)
              if (event === 'SIGNED_IN' && data.user?.id && !cartMigrated) {
                console.log('🛒 [NAVBAR] Migrating cart on sign in for user:', data.user.id)
                setCartMigrated(true)
                fetch('/api/cart/migrate', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' }
                }).catch(error => {
                  console.warn('Error migrating cart:', error)
                  setCartMigrated(false)
                })
              }

              // Reset migration flag on sign out
              if (event === 'SIGNED_OUT') {
                setCartMigrated(false)
              }
            } else {
              setUser(null)
            }
          } catch {
            setUser(null)
          }
        }
        setLoading(false)
      }
    )

    // Force loading to false after 5 seconds as fallback
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <nav className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="font-serif text-2xl font-bold">
                MerchLab
              </Link>
            </div>
            <div className="text-sm">Cargando...</div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-serif text-2xl font-bold">
              MerchLab
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {user ? (
                <>
                  <Link href="/mainpage" className="text-primary-foreground hover:text-white transition-colors">
                    Tienda
                  </Link>
                  <Link href="/seller-designs" className="text-primary-foreground hover:text-white transition-colors">
                    Mis Diseños
                  </Link>
                  <Link href="/cart" className="text-primary-foreground hover:text-white transition-colors">
                    Carrito
                  </Link>
                </>
              ) : (
                <>
                  <Link href="#features" className="text-primary-foreground hover:text-white transition-colors">
                    Características
                  </Link>
                  <Link href="#products" className="text-primary-foreground hover:text-white transition-colors">
                    Productos
                  </Link>
                  <Link href="#marketplace" className="text-primary-foreground hover:text-white transition-colors">
                    Mercado
                  </Link>
                  <Link href="#pricing" className="text-primary-foreground hover:text-white transition-colors">
                    Precios
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-primary-foreground">
                  Hola, {user.email?.split('@')[0]}
                </span>
                <Link href="/cart">
                  <Button variant="ghost" className="text-primary-foreground hover:text-white hover:bg-primary-foreground/10">
                    Carrito
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-primary-foreground hover:text-white hover:bg-primary-foreground/10"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-primary-foreground hover:text-white hover:bg-primary-foreground/10">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
