import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, IconButton, Stack, Chip } from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import { FaCube, FaIndustry, FaThermometerHalf, FaExclamationTriangle, FaTools, FaChartBar, FaUsers, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa'

const items = [
  { label: 'Dashboard', path: '/', icon: <FaCube /> },
  { label: 'Machines', path: '/machines', icon: <FaIndustry /> },
  { label: 'Sensors', path: '/sensors', icon: <FaThermometerHalf /> },
  { label: 'Alerts', path: '/alerts', icon: <FaExclamationTriangle /> },
  { label: 'Maintenance', path: '/maintenance', icon: <FaTools /> },
  { label: 'Reports', path: '/reports', icon: <FaChartBar /> },
  { label: 'Users', path: '/users', icon: <FaUsers /> },
  { label: 'Settings', path: '/settings', icon: <FaCog /> },
]

const Sidebar = ({ open, onToggle, mobileOpen, onMobileClose }) => {
  const location = useLocation()
  const drawerContent = (
    <Box sx={{ width: 280, bgcolor: 'background.paper', height: '100%', borderRight: '1px solid rgba(148,163,184,0.18)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 46, height: 46, borderRadius: 2, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
            <FaIndustry color="white" size={22} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>PlantCore</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>SCADA Control</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onToggle} size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
          <FaBars />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ px: 1.25, py: 1.25, flexGrow: 1 }}>
        <List>
          {items.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <ListItemButton
                key={item.label}
                component={NavLink}
                to={item.path}
                onClick={() => onMobileClose?.()}
                sx={{
                  borderRadius: 2,
                  mb: 0.7,
                  color: active ? 'primary.main' : 'text.secondary',
                  background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
                  '&:hover': { background: 'rgba(37,99,235,0.08)', transform: 'translateX(4px)' },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500 }} />
              </ListItemButton>
            )
          })}
        </List>
      </Box>
      <Box sx={{ p: 2.25 }}>
        <Box sx={{ borderRadius: 3, p: 2, background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(14,165,233,0.06))' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Shift Overview</Typography>
            <Chip label="Live" color="success" size="small" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>16 machines online • 2 interventions pending</Typography>
        </Box>
        <ListItemButton sx={{ mt: 1.5, borderRadius: 2, color: 'text.secondary' }}>
          <ListItemIcon sx={{ minWidth: 36 }}><FaSignOutAlt /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <>
      <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="persistent" open={open} onClose={onMobileClose} sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box', transition: 'width 0.25s ease' } }}>
        {drawerContent}
      </Drawer>
    </>
  )
}

export default Sidebar
