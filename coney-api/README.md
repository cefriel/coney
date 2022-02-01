# Coney Api

Coney API: backend of the Coney toolkit. Coney API is one of the components of the [Coney](https://github.com/cefriel/coney) toolkit for conversational surveys.

## Customize build configuration

The following parameter can be modified for a specific build:
- Log directory path: in file `src\main\resources\log4j.xml` modify the attribute `value` for the element `param` with attribute `name` equal to FileNamePattern.
- Unpublished surveys directory path: in class `src\main\java\com\cefriel\coneyapi\utils\Utils.java` in the `saveJsonToFile` method modify the variable `absolutePath`. 
- Swagger documentation enable/disable: in class `src\main\java\com\cefriel\coneyapi\config\ApplicationConfig.java` modify the boolean in the `api` method when calling `enable`.

### License

_Copyright 2020 Cefriel._

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
