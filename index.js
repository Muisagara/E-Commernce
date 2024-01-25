const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");

class EmployeeManager {
  async init() {
    const logoText = logo({ name: "Employee Manager" }).render();
    console.log(logoText);
    await this.loadMainPrompts();
  }

  async loadMainPrompts() {
    try {
      const { choice } = await prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          "View All Departments",
          "View All Roles",
          "View ALL Employees",
          "Add Role",
          "Add Employee",
          "Add Department",
          "Update Employee Role",
          "Quit",
        ],
      });

      switch (choice) {
        case "View All Employees":
          await this.viewEmployees();
          break;
        case "Add Employee":
          await this.addEmployee();
          break;
        case "Update Employee Role":
          await this.updateEmployeeRole();
          break;
        case "View All Roles":
          await this.viewRoles();
          break;
        case "Add Role":
          await this.addRole();
          break;
        case "View All Departments":
          await this.viewDepartments();
          break;
        case "Add Department":
          await this.addDepartment();
          break;
        case "Quit":
          this.quit();
          break;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      this.quit();
    }
  }
  
    async addEmployee() {
      try {
        const { first_name, last_name } = await prompt([
          {
            name: "first_name",
            message: "What is the employee's first name?",
          },
          {
            name: "last_name",
            message: "What is the employee's last name?",
          },
        ]);
  
        const [roles] = await db.findAllRoles();
        const roleChoices = roles.map(({ id, title }) => ({ name: title, value: id }));
  
        const { roleId } = await prompt({
          type: "list",
          name: "roleId",
          message: "What is the employee's role?",
          choices: roleChoices,
        });
  
        const [employees] = await db.findAllEmployees();
        const managerChoices = employees.map(({ id, first_name, last_name }) => ({
          name: `${first_name} ${last_name}`,
          value: id,
        }));
        managerChoices.unshift({ name: "None", value: null });
  
        const { managerId } = await prompt({
          type: "list",
          name: "managerId",
          message: "Who is the employee's manager?",
          choices: managerChoices,
        });
  
        const employee = {
          manager_id: managerId,
          role_id: roleId,
          first_name,
          last_name,
        };
  
        await db.createEmployee(employee);
        console.log(`Added ${first_name} ${last_name} to the database`);
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
  
    async updateEmployeeRole() {
      try {
        const [employees] = await db.findAllEmployees();
        const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
          name: `${first_name} ${last_name}`,
          value: id,
        }));
  
        const { employeeId } = await prompt({
          type: "list",
          name: "employeeId",
          message: "Which employee's role do you want to update?",
          choices: employeeChoices,
        });
  
        const [roles] = await db.findAllRoles();
        const roleChoices = roles.map(({ id, title }) => ({ name: title, value: id }));
  
        const { roleId } = await prompt({
          type: "list",
          name: "roleId",
          message: "Which role do you want to assign the selected employee?",
          choices: roleChoices,
        });
  
        await db.updateEmployeeRole(employeeId, roleId);
        console.log("Updated employee's role");
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
  
    async updateEmployeeManager() {
      try {
        const [employees] = await db.findAllEmployees();
        const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
          name: `${first_name} ${last_name}`,
          value: id,
        }));
  
        const { employeeId } = await prompt({
          type: "list",
          name: "employeeId",
          message: "Which employee's manager do you want to update?",
          choices: employeeChoices,
        });
  
        const [managers] = await db.findAllPossibleManagers(employeeId);
        const managerChoices = managers.map(({ id, first_name, last_name }) => ({
          name: `${first_name} ${last_name}`,
          value: id,
        }));
  
        const { managerId } = await prompt({
          type: "list",
          name: "managerId",
          message: "Which employee do you want to set as manager for the selected employee?",
          choices: managerChoices,
        });
  
        await db.updateEmployeeManager(employeeId, managerId);
        console.log("Updated employee's manager");
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
  
    async viewRoles() {
      try {
        const [roles] = await db.findAllRoles();
        console.log("\n");
        console.table(roles);
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
  
    async addRole() {
      try {
        const [departments] = await db.findAllDepartments();
        const departmentChoices = departments.map(({ id, name }) => ({ name, value: id }));
  
        const { title, salary, department_id } = await prompt([
          {
            name: "title",
            message: "What is the name of the role?",
          },
          {
            name: "salary",
            message: "What is the salary of the role?",
          },
          {
            type: "list",
            name: "department_id",
            message: "Which department does the role belong to?",
            choices: departmentChoices,
          },
        ]);
  
        const role = {
          title,
          salary,
          department_id,
        };
  
        await db.createRole(role);
        console.log(`Added ${title} to the database`);
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
  
    async viewDepartments() {
      try {
        const [departments] = await db.findAllDepartments();
        console.log("\n");
        console.table(departments);
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
  
    async addDepartment() {
      try {
        const { name } = await prompt({
          name: "name",
          message: "What is the name of the department?",
        });
  
        const department = { name };
  
        await db.createDepartment(department);
        console.log(`Added ${name} to the database`);
        await this.loadMainPrompts();
      } catch (error) {
        console.error("An error occurred:", error);
        this.quit();
      }
    }
    
    async viewEmployees() {
      const [employees] = await db.findAllEmployees();
      console.log("\n");
      console.table(employees);
      await this.loadMainPrompts();
    }
    
quit() {
  console.log("Goodbye!");
  process.exit();
}}


const employeeManager = new EmployeeManager();
employeeManager.init();
  

  
  