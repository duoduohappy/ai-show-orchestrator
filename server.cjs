require('./backend-common.cjs').setup(__dirname, Number(process.env.PORT||8788), require('./integrations.cjs'));
