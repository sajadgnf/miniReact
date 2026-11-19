const createElement = (type, props, ...children) => {
  return { type, props: { ...props, children } };
};

const createDom = (element) => {
  if (typeof element === "string" || typeof element === "number") {
    return document.createTextNode(element);
  }

  if (typeof element.type === "function") {
    return createDom(element.type(element.props));
  }
  const dom = document.createElement(element.type);

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === "children")
      value.forEach((child) => dom.appendChild(createDom(child)));
    else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, value);
    } else dom[key] = value;
  });

  return dom;
};

const reconcile = (parentDom, currentElement, newElement) => {
  const currentDom = parentDom.firstChild;
  if (currentElement === null && newElement === null) {
    return null;
  } else if (newElement === null) {
    if (
      typeof currentElement === "string" ||
      typeof currentElement === "number"
    ) {
      parentDom.textContent = "";
    } else {
      parentDom.removeChild(currentDom);
    }
  } else if (currentElement === null) {
    if (typeof newElement === "string" || typeof newElement === "number") {
      const dom = document.createTextNode(newElement);
      parentDom.appendChild(dom);
    } else {
      const dom = createDom(newElement);
      parentDom.appendChild(dom);
    }
  } else if (
    (typeof currentElement === "string" ||
      typeof currentElement === "number") &&
    (typeof newElement === "string" ||
      typeof newElement === "number")
  ) {
    currentDom.textContent = newElement;
  } else if (currentElement.type !== newElement.type) {
    const dom = createDom(newElement);
    parentDom.replaceChild(dom, parentDom.firstChild);
  } else if (currentElement.type === newElement.type) {
    Object.entries(currentElement.props).forEach(([key, value]) => {
      if (key === "children") {
        const oldChildren = currentElement.props.children;
        const newChildren = newElement.props.children;

        const maxLength = Math.max(oldChildren.length, newChildren.length);

        for (let i = 0; i < maxLength; i++) {
          reconcile(currentDom, oldChildren[i] ?? null, newChildren[i] ?? null);
        }
      } else if (newElement.props[key] !== value) {
        currentDom[key] = value;
      } else if (!(key in newElement.props)) {
        delete currentDom[key];
      }
    });
    Object.entries(newElement.props).forEach(([key, value]) => {
      if (!(key in currentElement.props)) currentDom[key] = value;
    });
  }
  return newElement;
};

let currentElement = null;

const render = (element, container) => {
  if (typeof element.type === "function") {
    element = element.type(element.props);
    return render(element, container);
  }

  currentElement = reconcile(container, currentElement, element);
};

function Welcome() {
  return createElement("h1", null, "welcome");
}

function App() {
  console.log("App executed");

  return createElement(
    "div",
    null,
    createElement(Welcome, null),
    createElement("p", null, "hello"),
  );
}

const react = document.getElementById("react");

render(createElement(App, null), react);
