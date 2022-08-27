package main

import (
	"encoding/json"
	"fmt"
	"runtime"
	"syscall/js"
)

func WasmError(err error) string {
	type eType struct {
		Error string `json:"error"`
	}

	data, _ := json.Marshal(eType{err.Error()})
	return string(data)
}

func main() {
	fmt.Printf("go wasm loaded\n")
	js.Global().Set("Ping", jsPing())
	js.Global().Set("ImportRootCertificate", jsImportRootCertificate())
	js.Global().Set("CloneRootCertificate", jsCloneRootCertificate())
	js.Global().Set("ExportCertificate", jsExportCertificate())
	js.Global().Set("GetVersion", jsGetVersion())
	<-make(chan bool)
}

func jsPing() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Printf("invoke: Ping()\n")

		defer func() {
			recover()
		}()

		params := PingParameters{}
		if err := json.Unmarshal([]byte(args[0].String()), &params); err != nil {
			return WasmError(err)
		}
		response := Ping(params)
		data, err := json.Marshal(response)
		if err != nil {
			return WasmError(err)
		}
		return string(data)
	})
}

func jsImportRootCertificate() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Printf("invoke: ImportRootCertificate()\n")

		defer func() {
			recover()
		}()

		params := ImportCertificateParameters{}
		if err := json.Unmarshal([]byte(args[0].String()), &params); err != nil {
			return WasmError(err)
		}
		response, err := ImportRootCertificate(params)
		if err != nil {
			return WasmError(err)
		}
		data, err := json.Marshal(response)
		if err != nil {
			return WasmError(err)
		}
		return string(data)
	})
}

func jsCloneRootCertificate() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Printf("invoke: CloneRootCertificate()\n")

		defer func() {
			recover()
		}()

		params := CloneCertificateParameters{}
		if err := json.Unmarshal([]byte(args[0].String()), &params); err != nil {
			return WasmError(err)
		}
		response, err := CloneRootCertificate(params)
		if err != nil {
			return WasmError(err)
		}
		data, err := json.Marshal(response)
		if err != nil {
			return WasmError(err)
		}
		return string(data)
	})
}

func jsExportCertificate() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Printf("invoke: ExportCertificate()\n")

		defer func() {
			recover()
		}()

		params := ExportCertificateParameters{}
		if err := json.Unmarshal([]byte(args[0].String()), &params); err != nil {
			return WasmError(err)
		}
		response, err := ExportCertificate(params)
		if err != nil {
			return WasmError(err)
		}
		data, err := json.Marshal(response)
		if err != nil {
			return WasmError(err)
		}
		return string(data)
	})
}

func jsGetVersion() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Printf("invoke: GetVersion()\n")

		return runtime.Version()[2:]
	})
}
