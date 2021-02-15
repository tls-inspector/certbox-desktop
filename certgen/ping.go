package main

import (
	"encoding/json"
	"os"
)

// ConfigPing ping config type
type ConfigPing struct {
	Nonce string
}

func ping(confFilePath string) {
	conf := ConfigPing{}
	f, err := os.OpenFile(confFilePath, os.O_RDONLY, 0644)
	if err != nil {
		fatalError(err)
	}
	defer closeAndDeleteFile(f)
	if err := json.NewDecoder(f).Decode(&conf); err != nil {
		fatalError(err)
	}

	type PingResponseType struct {
		OK    bool
		Nonce string
	}

	response := PingResponseType{
		OK:    true,
		Nonce: conf.Nonce,
	}

	json.NewEncoder(os.Stdout).Encode(response)
}
