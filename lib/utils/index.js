"use strict";

function validateLocalizeArguments(functionArguments = [], context) {
  functionArguments.forEach((arg) => {
    if (arg.type === "Identifier") {
      context.report({
        node: arg,
        loc: arg.loc,
        messageId: "onlyStringLiteralArgument",
      });
    } else if (arg.type === "TemplateLiteral") {
      arg.expressions.forEach((exp) => {
        if (exp.type === "Identifier") {
          context.report({
            node: exp,
            loc: exp.loc,
            messageId: "onlyStringLiteralArgument",
          });
        }
      });
    } else if (arg.type === "BinaryExpression") {
      if (arg.left.type === "Identifier") {
        context.report({
          node: arg.left,
          loc: arg.left.loc,
          messageId: "onlyStringLiteralArgument",
        });
      }

      if (arg.right.type === "Identifier") {
        context.report({
          node: arg.right,
          loc: arg.right.loc,
          messageId: "onlyStringLiteralArgument",
        });
      }
    }
  });
}

function checkLocalizeComponentUsage(componentProps = [], context, node) {
  const { i18nDefaultPropNode, valuesPropNode } = getPropNodes(componentProps);

  if (isInvalidTemplateLiteral(i18nDefaultPropNode.value.expression)) {
    reportInvalidTemplateLiteral(
      i18nDefaultPropNode.value.expression.expressions,
      context
    );
    return;
  }

  const identifiersListInString = findIdentifiersInString(
    i18nDefaultPropNode.value.value
  );

  const uniqueIdentifiersInLiteral = new Set(identifiersListInString);
  const uniqueIdArray = Array.from(uniqueIdentifiersInLiteral);

  if (identifiersListInString.length > 0) {
    if (!valuesPropNode) {
      reportMissingProperties(node, uniqueIdArray, context);
      return;
    }

    const nodeProperties = valuesPropNode.value.expression.properties;

    const notFoundValues = [];

    uniqueIdArray.forEach((x, i) => {
      if (!nodeProperties.find((y) => y.key.name === x)) {
        notFoundValues.push(x);
      }
    });

    if (notFoundValues.length > 0) {
      context.report({
        node: valuesPropNode,
        loc: valuesPropNode.loc,
        messageId: "passCorrectProperties",
        data: {
          identifiers: notFoundValues.join(", "),
        },
      });

      return;
    }

    arePropertiesFromValidStringIdentifiers(
      nodeProperties,
      uniqueIdentifiersInLiteral,
      context
    );
  }
}

function getPropNodes(props) {
  let i18nDefaultPropNode;
  let valuesPropNode;

  props.forEach((prop) => {
    if (prop.name.name === "i18n_default_text") {
      i18nDefaultPropNode = prop;
    } else if (prop.name.name === "values") {
      valuesPropNode = prop;
    }
  });

  return { i18nDefaultPropNode, valuesPropNode };
}

function isInvalidTemplateLiteral(expression) {
  return (
    expression?.type === "TemplateLiteral" && expression.expressions.length > 0
  );
}

function reportInvalidTemplateLiteral(expressions, context) {
  expressions.forEach((expression) => {
    context.report({
      node: expression,
      loc: expression.loc,
      messageId: "invalidTemplateLiteral",
    });
  });
}

function reportMissingProperties(node, identifiers, context) {
  context.report({
    node,
    messageId: "passCorrectProperties",
    data: {
      identifiers: identifiers.join(", "),
    },
  });
}

function arePropertiesFromValidStringIdentifiers(
  properties,
  uniqueIdentifiersInLiteral,
  context
) {
  properties.some((property) => {
    if (!uniqueIdentifiersInLiteral.has(property.key.name)) {
      reportExtraProperty(property, context);
      return true;
    }
  });
}

function reportExtraProperty(property, context) {
  context.report({
    node: property,
    messageId: "avoidExtraProperties",
    data: {
      property: property.key.name,
    },
  });
}

function findIdentifiersInString(stringLiteral) {
  const regex = /{{(.*?)}}/g;
  const identifiers = [];

  let match;
  while ((match = regex.exec(stringLiteral)) !== null) {
    identifiers.push(match[1]);
  }

  return identifiers;
}

module.exports = {
  validateLocalizeArguments,
  arePropertiesFromValidStringIdentifiers,
  findIdentifiersInString,
  checkLocalizeComponentUsage,
};
