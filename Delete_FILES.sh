#!/bin/bash
find Data/AMSR2/ -type f -mtime +30 -delete
find Data/AMSR2/ -type d -empty -delete
find Data/GPV/ -type f -mtime +30 -delete
find Data/GPV/ -type d -empty -delete
find Data/WEB/data/ -type f -mtime +30 -delete
find Data/WEB/data/ -type d -empty -delete

