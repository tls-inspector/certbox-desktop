const fs = require('fs');

for (var i = 2; i < process.argv.length; i++) {
    const moduleName = process.argv[i];

    var output = "import * as React from 'react';\n\n";
    output += "export interface " + moduleName + "Props {}\n";
    output += "interface " + moduleName + "State {}\n";
    output += "export class " + moduleName + " extends React.Component<" + moduleName + "Props, " + moduleName + "State> {\n";
    output += "    constructor(props: " + moduleName + "Props) {\n";
    output += "        super(props);\n";
    output += "        this.state = {};\n";
    output += "    }\n\n";
    output += "    render(): JSX.Element {\n";
    output += "        return (\n";
    output += "            <div></div>\n";
    output += "        );\n";
    output += "    }\n";
    output += "}\n";

    fs.writeFileSync(moduleName + '.tsx', output);
}
