# openCvisualizer
## License
[![Creative Commons License](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)  
This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
## Build
* Prerequisites: Python, cpp (add to PATH), TypeScript, node, npm.
* Commands to run:
    * ui folder:
        * `npm install` (install dependencies)
        * `npm run sass` (compile SCSS)
        * `tsc` (compile TypeScript)
    * be folder:
        * `npm install` (install dependencies)
        * `npm run installPythonDependencies` (initialize Python dependencies)
        * `tsc` (compile TypeScript)
## Start
Run `npm start` in the be folder
The server will run on [http://localhost:3000](http://localhost:3000) (the port can be defined by the `DIS_PORT` environment variable)
## Demo
[OpenCVisualizer](http://aranos.go.ro/)
