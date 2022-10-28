package main

import (
	"encoding/json"
	"io"
	"os"
)

// ConfigPing ping config type
type ConfigPing struct {
	Nonce string
}

func ping(confReader io.Reader) {
	conf := ConfigPing{}
	if err := json.NewDecoder(confReader).Decode(&conf); err != nil {
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
