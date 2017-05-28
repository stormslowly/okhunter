module.exports = {
  apps: [
    {
      name: "dataHunter",
      script: "start.js",
      env: {},
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "root",
      host: "weibus",
      ref: "origin/master",
      repo: "git@github.com:stormslowly/okhunter.git",
      path: "/var/www/production",
      "post-deploy": "npm run build && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
}
