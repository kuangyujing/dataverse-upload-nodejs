# dataverse-upload-nodejs

## Recources

### Storage Account
https://portal.azure.com/#@idcld.jp/resource/subscriptions/ed070054-1009-48dd-8bc0-b9c2ee96d858/resourcegroups/nakane_Azure/providers/Microsoft.Storage/storageAccounts/lassta/overview

* Name: lassta
* Location: Japan East
* performance: Standard
* Replication: Locally-redundant storage (LRS)
* Account kind: StorageV2 (general purpose v2)

## App Service
https://portal.azure.com/#@idcld.jp/resource/subscriptions/ed070054-1009-48dd-8bc0-b9c2ee96d858/resourcegroups/nakane_Azure/providers/Microsoft.Web/sites/lasapsvc/appServices

#### Web App

* Name: lasapsvc
* Publish: Code
* Runtime stack: Node 18 LTS

#### App Service Plan

* Name: lasasp
* Operating System: Linux
* Region: Japan East
* SKU: Premium V3
* Size: Small
* ACU: 195
* Memory: 8GB

## Deployment

### `az-deploy.sh`

```json
{
  "active": true,
  "author": "N/A",
  "author_email": "N/A",
  "build_summary": {
    "errors": [],
    "warnings": []
  },
  "complete": true,
  "deployer": "OneDeploy",
  "end_time": "2023-06-06T23:55:20.4538136Z",
  "id": "e09a5013-c8e4-4e58-b769-42285c8d9d17",
  "is_readonly": true,
  "is_temp": false,
  "last_success_end_time": "2023-06-06T23:55:20.4538136Z",
  "log_url": "https://lasapsvc.scm.azurewebsites.net/api/deployments/latest/log",
  "message": "OneDeploy",
  "progress": "",
  "received_time": "2023-06-06T23:53:36.4356683Z",
  "site_name": "lasapsvc",
  "start_time": "2023-06-06T23:53:37.8755323Z",
  "status": 4,
  "status_text": "",
  "url": "https://lasapsvc.scm.azurewebsites.net/api/deployments/latest"
}
```
