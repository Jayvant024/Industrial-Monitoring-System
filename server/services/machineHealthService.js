const db = require('../config/db');

const getHealthStatus = (health) => {
  if (health >= 80) return 'Running';
  if (health >= 60) return 'Warning';
  if (health >= 40) return 'Maintenance';
  if (health >= 20) return 'Critical';
  return 'Fault';
};

const updateMachineHealth = async () => {
  const sql = `
   SELECT machine_id, machine_name, machine_health, status, operating_hours
    FROM machines
    WHERE status IN ('Running','Warning','Maintenance','Critical')
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, async (err, machines) => {
      if (err) return reject(err);

      for (const machine of machines) {
        try {
          let nextHealth = Number(machine.machine_health ?? 100);
          let nextHours = Number(machine.operating_hours ?? 0);

          if (nextHealth <= 0) {
            try {
              const faultSql = `
                UPDATE machines
                SET machine_health = 0,
                    status = 'Fault',
                    last_health_update = NOW()
                WHERE machine_id = ? AND status IN ('Running','Warning','Maintenance','Critical')
              `;

              const faultResult = await new Promise((resolveFault, rejectFault) => {
                db.query(faultSql, [machine.machine_id], (faultErr, res) => {
                  if (faultErr) return rejectFault(faultErr);
                  resolveFault(res);
                });
              });

              if (faultResult && faultResult.affectedRows > 0) {
                console.log(`Machine ${machine.machine_id} ${machine.machine_name}: health <= 0, marked Fault`);
              }
            } catch (faultErr) {
              console.error('Failed marking machine as Fault', machine.machine_id, faultErr);
            }
            continue;
          }

          const drop = Math.floor(Math.random() * 3) + 1;
          nextHealth = Math.max(0, nextHealth - drop);
          nextHours += 1;

          const nextStatus = nextHealth <= 0 ? 'Fault' : getHealthStatus(nextHealth);

          const updateSql = `
            UPDATE machines
            SET
              machine_health = ?,
             operating_hours = ?
              last_health_update = NOW(),
              status = CASE WHEN ? IN ('Running','Stopped','Maintenance','Fault') THEN ? ELSE status END
            WHERE machine_id = ? AND status IN ('Running','Warning','Maintenance','Critical')
          `;

          const updateResult = await new Promise((resolveUpdate, rejectUpdate) => {
            db.query(updateSql, [nextHealth, nextHours, nextStatus, nextStatus, machine.machine_id], (updateErr, res) => {
              if (updateErr) return rejectUpdate(updateErr);
              resolveUpdate(res);
            });
          });

          if (updateResult && updateResult.affectedRows > 0) {
            console.log(`Machine ${machine.machine_id} ${machine.machine_name}: ${machine.machine_health ?? 'N/A'} -> ${nextHealth} | status: ${nextStatus} | hours: ${nextHours}`);

            if (nextHealth < 50) {
              const alertSql = `
                INSERT INTO alerts (machine_id, alert_type, message, severity, created_at)
                VALUES (?, 'Maintenance', ?, 'High', NOW())
                ON DUPLICATE KEY UPDATE message = VALUES(message), severity = VALUES(severity), created_at = NOW()
              `;

              await new Promise((resolveAlert, rejectAlert) => {
                db.query(alertSql, [machine.machine_id, `${machine.machine_name} health dropped to ${nextHealth}%`], (alertErr) => {
                  if (alertErr) return rejectAlert(alertErr);
                  resolveAlert();
                });
              });
            }
          } else {
            // Update did not apply because machine status changed (e.g., to Stopped/Fault); skip alerts and further processing
            console.log(`Skipped updating machine ${machine.machine_id} because its status changed; skipping simulation for this tick.`);
          }
        } catch (itemErr) {
          console.error('Health simulation error for machine', machine.machine_id, itemErr);
        }
      }

      resolve();
    });
  });
};

const startHealthSimulation = () => {
  setInterval(() => {
    updateMachineHealth().catch((error) => {
      console.error('Machine health simulation failed:', error.message);
    });
  }, 15000);
};

module.exports = {
  updateMachineHealth,
  startHealthSimulation,
  getHealthStatus,
};
