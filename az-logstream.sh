#!/usr/bin/env bash

az webapp log tail \
    --name lasapsvc \
    --resource-group nakane_Azure \
    --verbose
