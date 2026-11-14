jq '.modelUsage | map_values({costUSD, costBasis})' answer.json
