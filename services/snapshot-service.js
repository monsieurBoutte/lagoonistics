const fs = require('fs');

const SNAPSHOT_DIR = 'snapshots/';

// Saves the snapshot in a new file in the snapshots dir if not exists already
async function saveSnapshot(snapshot) {
  // Ensure file doesn't collide with another snapshot first
  const existingSnapshot = await getSnapshot(snapshot.filename);
  if (existingSnapshot) return

  // See if there's a previous snapshot to link this new one to it
  const previousSnapshot = await getPrevious(snapshot);
  if (previousSnapshot) {
    console.log("Found previous snapshot -------");
    console.log(previousSnapshot);
    snapshot.previous = previousSnapshot;
    console.log(snapshot.previous);
  }

  // Convert to JSON and write to disk
  const data = JSON.stringify(snapshot);
  const error = await fs.writeFile(SNAPSHOT_DIR + snapshot.filename, data);
  //TODO: Handle error
  return error;
}

// Given a snapshot, returns the snapshot immediately preceeding it or nil if none exists
async function getPrevious(snapshot) {
  const id = snapshot.sensorId
  const previous = await getLatestSnapshotBySensorId(snapshot.sensorId);
  return previous
}

// Gets a snapshot by filename
async function getSnapshot(filename) {
  try {
    var snapshot = await fs.open(SNAPSHOT_DIR + filename, 'a');
    snapshot = JSON.parse(snapshot)
  } catch(e) {
    return null
  }

  return snapshot;
}

async function getLatestSnapshotBySensorId(sensorId) {
  return new Promise((resolve, reject) => {
    // Get contents of snapshots folder
    fs.readdir(SNAPSHOT_DIR, function(err, items) {
      if (err) reject(err);

      // Get snapshots by sensorId
      items = items.filter(item => item.includes(sensorId));

      // Sort by date
      items.sort( (a,b) => {
        return parseFloat(a.replace(/[^0-9]/g, '')) - parseFloat(b.replace(/[^0-9]/g, ''))
      });

      resolve(items[0]);
    });
  });
}

async function getLatestSnapshotBySource(source) {
  try {
    // Get contents of snapshots folder
    const items = await fs.readdir(SNAPSHOT_DIR);
    items.sort( (a,b) => {
      return parseFloat(a.replace(/[^0-9]/g, '')) - parseFloat(b.replace(/[^0-9]/g, ''))
    });
  } catch(e) {
    console.log(e);
  }
}

module.exports = saveSnapshot;
