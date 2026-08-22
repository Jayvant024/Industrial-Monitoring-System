import { useMemo, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { FaBars, FaBell, FaClock, FaMoon, FaSearch, FaSun } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

import Sidebar from '../Sidebar/Sidebar'
import AppRoutes from '../../routes'

const Layout = ({ mode, onToggleTheme }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const location = useLocation()
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentDate = useMemo(
    () =>
      new Date().toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  )

  // =========================
  // LOGIN PAGE
  // =========================
  if (!isAuthenticated || location.pathname === '/login') {
    return <AppRoutes />
  }

  // =========================
  // MAIN APPLICATION LAYOUT
  // =========================
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* TOP BAR */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid rgba(148,163,184,0.18)',
          }}
        >
          <Toolbar
            sx={{
              gap: 1.5,
              minHeight: { xs: 72, md: 80 },
            }}
          >
            <IconButton
              onClick={() =>
                isMobile
                  ? setMobileOpen(true)
                  : setSidebarOpen((prev) => !prev)
              }
              sx={{
                border: '1px solid rgba(148,163,184,0.25)',
              }}
            >
              <FaBars />
            </IconButton>

            {/* SEARCH */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  px: 1.25,
                  py: 0.8,
                  borderRadius: 999,
                  bgcolor: 'rgba(37,99,235,0.08)',
                }}
              >
                <FaSearch />

                <InputBase
                  placeholder="Search assets..."
                  sx={{
                    minWidth: 220,
                    color: 'text.primary',
                  }}
                />
              </Box>
            </Box>

            {/* RIGHT SIDE */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <IconButton
                onClick={onToggleTheme}
                sx={{
                  border: '1px solid rgba(148,163,184,0.25)',
                }}
              >
                {mode === 'light' ? <FaMoon /> : <FaSun />}
              </IconButton>

              <IconButton
                sx={{
                  border: '1px solid rgba(148,163,184,0.25)',
                }}
              >
                <FaBell />
              </IconButton>

              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{
                  px: 1,
                  py: 0.7,
                  borderRadius: 999,
                  bgcolor: 'rgba(37,99,235,0.08)',
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: 'primary.main',
                  }}
                >
                  SC
                </Avatar>

                <Box
                  sx={{
                    display: {
                      xs: 'none',
                      lg: 'block',
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700 }}
                  >
                    S. Carter
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Plant Director
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* PAGE CONTENT */}
        <Container
          maxWidth="xl"
          sx={{
            py: 3,
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            alignItems={{
              xs: 'flex-start',
              md: 'center',
            }}
            sx={{
              mb: 3,
              gap: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <FaClock />
              {currentDate}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              Secure industrial monitoring • Live operations dashboard
            </Typography>
          </Stack>

          <AppRoutes />
        </Container>
      </Box>
    </Box>
  )
}

export default Layout