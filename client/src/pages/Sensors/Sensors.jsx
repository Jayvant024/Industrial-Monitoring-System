import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  FaTemperatureHalf,
  FaWaveSquare,
  FaGaugeHigh,
  FaBolt
} from 'react-icons/fa6'
import PageShell from '../../components/Layout/PageShell'
import { getSensorStatuses } from '../../services/sensorService'


const Sensors = () => {

  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =====================================================
  // LOAD SENSOR DATA
  // =====================================================

  const loadSensors = async () => {

    try {

      const data = await getSensorStatuses()

      setSensors(data)
      setError('')

    } catch (err) {

      console.error('Sensor loading error:', err)

      setError('Unable to load live sensor data.')

    } finally {

      setLoading(false)

    }

  }


  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {

    loadSensors()

    const interval = setInterval(() => {

      loadSensors()

    }, 5000)

    return () => clearInterval(interval)

  }, [])


  // =====================================================
  // GROUP SENSORS BY MACHINE
  // =====================================================

  const machineGroups = useMemo(() => {

    const groups = {}

    sensors.forEach((sensor) => {

      if (!groups[sensor.machine_id]) {

        groups[sensor.machine_id] = {
          machine_id: sensor.machine_id,
          machine_name: sensor.machine_name,
          sensors: []
        }

      }

      groups[sensor.machine_id].sensors.push(sensor)

    })

    return Object.values(groups)

  }, [sensors])


  // =====================================================
  // SENSOR STATUS COUNTS
  // =====================================================

  const sensorStats = useMemo(() => {

    return {
      total: sensors.length,

      normal: sensors.filter(
        sensor => sensor.status === 'Normal'
      ).length,

      warning: sensors.filter(
        sensor => sensor.status === 'Warning'
      ).length,

      critical: sensors.filter(
        sensor => sensor.status === 'Critical'
      ).length
    }

  }, [sensors])


  // =====================================================
  // SENSOR ICON
  // =====================================================

 const getSensorIcon = (sensorName) => {
  const name = sensorName.toLowerCase()

  if (name.includes('temperature')) {
    return <FaTemperatureHalf />
  }

  if (name.includes('vibration')) {
    return <FaWaveSquare />
  }

  if (name.includes('pressure')) {
    return <FaGaugeHigh />
  }

  if (name.includes('current')) {
    return <FaBolt />
  }

  if (name.includes('rpm')) {
    return <FaGaugeHigh />
  }

  return null
}


  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (status) => {

    if (status === 'Critical') {
      return 'error'
    }

    if (status === 'Warning') {
      return 'warning'
    }

    return 'success'

  }


  // =====================================================
  // CARD BORDER
  // =====================================================

  const getBorderColor = (status) => {

    if (status === 'Critical') {
      return '#ef4444'
    }

    if (status === 'Warning') {
      return '#f97316'
    }

    return '#22c55e'

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <PageShell
        title="Sensor Intelligence"
        subtitle="Real-time monitoring of vibration, thermal, pressure, and electrical telemetry."
      >

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300
          }}
        >

          <Stack
            spacing={2}
            alignItems="center"
          >

            <CircularProgress />

            <Typography color="text.secondary">
              Loading live sensor data...
            </Typography>

          </Stack>

        </Box>

      </PageShell>

    )

  }


  return (

    <PageShell
      title="Sensor Intelligence"
      subtitle="Real-time monitoring of vibration, thermal, pressure, and electrical telemetry."
    >

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>

      )}


      {/* =====================================================
          TOP SUMMARY
      ===================================================== */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: 2
        }}
      >

        <CardContent>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row'
            }}
            justifyContent="space-between"
            alignItems={{
              xs: 'flex-start',
              sm: 'center'
            }}
            spacing={2}
          >

            <Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800
                }}
              >
                Live Sensor Monitoring
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Real-time machine sensor telemetry
              </Typography>

            </Box>


            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
            >

              <Chip
                label={`${sensorStats.total} Sensors`}
                color="primary"
                size="small"
              />

              <Chip
                label={`${sensorStats.normal} Normal`}
                color="success"
                size="small"
              />

              <Chip
                label={`${sensorStats.warning} Warning`}
                color="warning"
                size="small"
              />

              <Chip
                label={`${sensorStats.critical} Critical`}
                color="error"
                size="small"
              />

            </Stack>

          </Stack>

        </CardContent>

      </Card>


      {/* =====================================================
          NO DATA
      ===================================================== */}

      {machineGroups.length === 0 && (

        <Card
          sx={{
            borderRadius: 3,
            p: 4,
            textAlign: 'center'
          }}
        >

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700
            }}
          >
            No Sensor Data Available
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Start a machine with active sensors to see live telemetry.
          </Typography>

        </Card>

      )}


      {/* =====================================================
          MACHINE GROUPS
      ===================================================== */}

      <Stack spacing={4}>

        {machineGroups.map((machine) => (

          <Box
            key={machine.machine_id}
          >

            {/* =================================================
                MACHINE HEADER
            ================================================= */}

            <Box
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >

              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#2563eb',
                  boxShadow: '0 0 0 4px rgba(37,99,235,0.12)'
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                {machine.machine_name}
              </Typography>

            </Box>


            <Box
              sx={{
                borderBottom: '2px solid',
                borderColor: 'divider',
                mb: 2
              }}
            />


            {/* =================================================
                SENSOR CARDS
            ================================================= */}

            <Grid
              container
              spacing={2}
            >

              {machine.sensors.map((sensor) => (

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={sensor.machine_sensor_id}
                >

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 12
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      duration: 0.25
                    }}
                    style={{
                      height: '100%'
                    }}
                  >

                    <Card
                      sx={{
                        height: '100%',
                        minHeight: 190,
                        borderRadius: 3,
                        border: `1.5px solid ${getBorderColor(sensor.status)}`,
                        boxShadow: 1,
                        transition: '0.2s',

                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >

                      <CardContent>

                        {/* SENSOR NAME + STATUS */}

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 2 }}
                        >

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >

                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(37,99,235,0.1)',
                                color: '#2563eb'
                              }}
                            >

                              {getSensorIcon(sensor.sensor_name)}

                            </Box>

                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800
                              }}
                            >
                              {sensor.sensor_name
                                .replace(sensor.machine_name, '')
                                .trim()
                              }
                            </Typography>

                          </Stack>


                          <Chip
                            label={sensor.status}
                            color={getStatusColor(sensor.status)}
                            size="small"
                            sx={{
                              fontWeight: 700
                            }}
                          />

                        </Stack>


                        {/* VALUE */}

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            lineHeight: 1.2,
                            mb: 1
                          }}
                        >

                          {Number(sensor.reading_value).toFixed(2)}

                          <Typography
                            component="span"
                            variant="body1"
                            color="text.secondary"
                            sx={{
                              ml: 0.7,
                              fontWeight: 600
                            }}
                          >
                            {sensor.unit}
                          </Typography>

                        </Typography>


                        {/* MACHINE */}

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1.5
                          }}
                        >
                          {machine.machine_name}
                        </Typography>


                        {/* THRESHOLDS */}

                        <Stack spacing={0.5}>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Warning: {sensor.warning_value} {sensor.unit}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Critical: {sensor.critical_value} {sensor.unit}
                          </Typography>

                        </Stack>

                      </CardContent>

                    </Card>

                  </motion.div>

                </Grid>

              ))}

            </Grid>

          </Box>

        ))}

      </Stack>

    </PageShell>

  )

}

export default Sensors