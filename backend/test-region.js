const { Client } = require('pg');

const regions = [
  'ap-south-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'sa-east-1', 'ca-central-1', 'ap-east-1'
];

async function checkRegion(region) {
  const client = new Client({
    connectionString: `postgresql://postgres.mszmuyhhxymxvjzzsjlk:QlS5bEU9kiYIdfxm@aws-0-${region}.pooler.supabase.com:6543/postgres`,
    statement_timeout: 5000
  });
  try {
    await client.connect();
    console.log(`SUCCESS: Region is ${region}`);
    await client.end();
    return true;
  } catch (err) {
    return false;
  }
}

async function run() {
  const promises = regions.map(async r => {
    const works = await checkRegion(r);
    if (works) {
        process.exit(0);
    }
  });
  await Promise.allSettled(promises);
  console.log("FAILED to find region");
}
run();
