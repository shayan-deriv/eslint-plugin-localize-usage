//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/only-string-literal-argument");

const parsers = require("../../helpers/parsers");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ERROR_MESSAGE = "You can only use string literals with localise function";

const ruleTester = new RuleTester({ parser: parsers.BABEL_ESLINT });
ruleTester.run("only-string-literal-argument", rule, {
  valid: [
    {
      code: "localize('this is my translation key')"
    },
    {
      code: "localize(`this is my translation key with template literals`)"
    },
  ],

  invalid: [
    {
      code: "localize('invalid use', some_variable)",
      errors: [
        {
          message: ERROR_MESSAGE,
          line: 1,
          column: 25,
          type: "Identifier"
        }
      ]
    },
    {
      code: "localize('invalid use' + some_variable)",
      errors: [
        {
          message: ERROR_MESSAGE,
          line: 1,
          column: 26,
          type: "Identifier"
        }
      ]
    },
    {
      code: "localize(some_new_variable + 'invalid use')",
      errors: [
        {
          message: ERROR_MESSAGE,
          line: 1,
          column: 10,
          type: "Identifier"
        }
      ]
    },
    {
      code: "localize(some_new_variable + 'invalid use' + some_variable)",
      errors: [
        {
          message: ERROR_MESSAGE,
          line: 1,
          column: 46,
          type: "Identifier"
        }
      ]
    },
    {
      code: "localize(some_variable)",
      errors: [
        {
          message: ERROR_MESSAGE,
          line: 1,
          column: 10,
          type: "Identifier"
        }
      ]
    },
    {
      code: "localize(`invalid use : ${some_variable}`)",
      errors: [
        {
          message: ERROR_MESSAGE,
          line: 1,
          column: 27,
          type: "Identifier"
        }
      ]
    },
  ]
});
