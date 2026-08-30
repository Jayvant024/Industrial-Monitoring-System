const db = require('../config/db');

const updateMachineHealth = async () => {
  const sql = `
    SELECT
      machine_id,
      machine_name,
      machine_health,
      status,
      operating_hours
    FROM machines
    WHERE status IN ('Running', 'Maintenance')
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, async (err, machines) => {
      if (err) {
        console.error('Health simulation database error:', err);
        return reject(err);
      }

      for (const machine of machines) {
        try {
          const currentHealth = Number(machine.machine_health ?? 100);
          const currentHours = Number(machine.operating_hours ?? 0);

          // Running and Maintenance machines continue operating.
          // Stopped and Fault machines are NOT selected above.

          // If already at/below 0, make it Fault.
          if (currentHealth <= 0) {
            await updateMachine(machine.machine_id, 0, currentHours, 'Fault');

            console.log(
              `Machine ${machine.machine_id} ${machine.machine_name}: ` +
              `Health 0% → Fault`
            );

            continue;
          }

          // Decrease health by 1% every simulation cycle.
          const nextHealth = Math.max(0, currentHealth - 1);

          // Running and Maintenance both increase operating hours.
          const nextHours = currentHours + 1;

          let nextStatus;

          /*
           * HEALTH STATUS RULES
           *
           * 50% and above  → Running
           * 20% to 49%     → Maintenance
           * Below 20%      → Fault
           */
          if (nextHealth < 20) {
            nextStatus = 'Fault';
          } else if (nextHealth < 50) {
            nextStatus = 'Maintenance';
          } else {
            nextStatus = 'Running';
          }

          await updateMachine(
            machine.machine_id,
            nextHealth,
            nextHours,
            nextStatus
          );

          console.log(
            `Machine ${machine.machine_id} ${machine.machine_name}: ` +
            `${currentHealth}% → ${nextHealth}% | ` +
            `Status: ${nextStatus} | ` +
            `Hours: ${nextHours}`
          );

        } catch (itemErr) {
          console.error(
            `Health simulation error for machine ${machine.machine_id}:`,
            itemErr
          );
        }
      }

      resolve();
    });
  });
};


const updateMachine = (
  machineId,
  health,
  operatingHours,
  status
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE machines
      SET
        machine_health = ?,
        operating_hours = ?,
        status = ?,
        last_health_update = NOW()
      WHERE machine_id = ?
        AND status IN ('Running', 'Maintenance')
    `;

    db.query(
      sql,
      [health, operatingHours, status, machineId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      }
    );
  });
};


const startHealthSimulation = () => {
  console.log('📉 Machine health simulation started');

  // Run once immediately
  updateMachineHealth().catch((error) => {
    console.error(
      'Machine health simulation failed:',
      error.message
    );
  });

  // Then run every 30 seconds
  setInterval(() => {
    updateMachineHealth().catch((error) => {
      console.error(
        'Machine health simulation failed:',
        error.message
      );
    });
  }, 30000);
};


module.exports = {
  updateMachineHealth,
  startHealthSimulation
};