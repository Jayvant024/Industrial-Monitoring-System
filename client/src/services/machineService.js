import api from '../api/axios'
import hydraulicPress from '../assets/images/hydraulic-press.svg'
import cncMachine from '../assets/images/cnc-machine.svg'
import latheMachine from '../assets/images/lathe-machine.svg'
import compressor from '../assets/images/compressor.svg'
import generator from '../assets/images/generator.svg'
import boiler from '../assets/images/boiler.svg'
import conveyor from '../assets/images/conveyor.svg'

const imageMap = {
  hydraulic: hydraulicPress,
  cnc: cncMachine,
  lathe: latheMachine,
  compressor,
  generator,
  boiler,
  conveyor,
}

const normalizeMachine = (machine) => {
  const category = String(machine.category_name || machine.category || 'Industrial').toLowerCase()
  const imageKey = category.includes('hydraulic')
    ? 'hydraulic'
    : category.includes('cnc')
      ? 'cnc'
      : category.includes('lathe')
        ? 'lathe'
        : category.includes('compressor')
          ? 'compressor'
          : category.includes('generator')
            ? 'generator'
            : category.includes('boiler')
              ? 'boiler'
              : category.includes('conveyor')
                ? 'conveyor'
                : 'hydraulic'

  const healthValue = Number(machine.machine_health ?? machine.health ?? 85)

  return {
    ...machine,
    machine_id: machine.machine_id ?? machine.id,
    machine_code: machine.machine_code ?? 'N/A',
    machine_name: machine.machine_name ?? 'Unnamed Machine',
    category_name: machine.category_name ?? 'Industrial',
    manufacturer: machine.manufacturer ?? 'OEM',
    model: machine.model ?? 'Standard',
    serial_number: machine.serial_number ?? '',
    location: machine.location ?? 'Unassigned',
    status: machine.status ?? 'Running',
    health: Number.isFinite(healthValue) ? Math.round(healthValue) : 85,
    sensor_count: machine.sensor_count ?? 8,
    last_maintenance: machine.last_maintenance ?? 'Pending',
    description: machine.description ?? 'Critical industrial equipment.',
    image: machine.image_url ?? machine.image ?? imageMap[imageKey] ?? hydraulicPress,
  }
}

export const buildMachinePayload = (payload) => ({
  machine_code: payload.machine_code,
  machine_name: payload.machine_name,
  category_id: Number(payload.category_id || 1),
  manufacturer: payload.manufacturer || 'OEM',
  model: payload.model || 'Standard',
  serial_number: payload.serial_number || `SN-${Date.now()}`,
  location: payload.location || 'Unassigned',
  status: payload.status || 'Running',
})

export const getMachines = async () => {
  const response = await api.get('/api/machines')
  const data = response?.data?.data ?? response?.data ?? []
  return (Array.isArray(data) ? data : []).map(normalizeMachine)
}

export const getMachineById = async (id) => {
  const response = await api.get(`/api/machines/${id}`)
  const machine = response?.data?.data ?? response?.data ?? null
  return machine ? normalizeMachine(machine) : null
}

export const createMachine = async (payload) => {
  const response = await api.post('/api/machines', buildMachinePayload(payload))
  return response.data
}

export const updateMachine = async (id, payload) => {
  const response = await api.put(`/api/machines/${id}`, buildMachinePayload(payload))
  return response.data
}

export const deleteMachine = async (id) => {
  const response = await api.delete(`/api/machines/${id}`)
  return response.data
}
