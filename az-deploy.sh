#/usr/bin/env bash

# Create Zip deployment package
rm -f build/package.zip
zip -rq build/package.zip . \
    -x '.??*'

# Deploy to Azure
az webapp deploy \
    --name lasapsvc \
    --resource-group nakane_Azure \
    --src-path build/package.zip \
    --type zip \
    --verbose

# if deployment succeeds, the following JSON is returned
#
# {
#   "active": true,
#   "author": "N/A",
#   "author_email": "N/A",
#   "build_summary": {
#     "errors": [],
#     "warnings": []
#   },
#   "complete": true,
#   "deployer": "OneDeploy",
#   "end_time": "2023-06-06T23:55:20.4538136Z",
#   "id": "e09a5013-c8e4-4e58-b769-42285c8d9d17",
#   "is_readonly": true,
#   "is_temp": false,
#   "last_success_end_time": "2023-06-06T23:55:20.4538136Z",
#   "log_url": "https://lasapsvc.scm.azurewebsites.net/api/deployments/latest/log",
#   "message": "OneDeploy",
#   "progress": "",
#   "received_time": "2023-06-06T23:53:36.4356683Z",
#   "site_name": "lasapsvc",
#   "start_time": "2023-06-06T23:53:37.8755323Z",
#   "status": 4,
#   "status_text": "",
#   "url": "https://lasapsvc.scm.azurewebsites.net/api/deployments/latest"
# }
