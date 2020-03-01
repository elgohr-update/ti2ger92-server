#!/usr/bin/env bash

mongod &

sleep 5

export NODE_OPTIONS=--max-old-space-size=5120

npm run dev