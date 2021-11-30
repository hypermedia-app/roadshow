# @hydrofoil/roadshow

## 0.3.6

### Patch Changes

- 145dbfb: Switching shape should inspect `dash:viewer` and select its renderer

## 0.3.5

### Patch Changes

- c8dbdc3: Decorator's `.appliesTo` should take entire context

## 0.3.4

### Patch Changes

- 369071d: Ability to change shape
- 2e0e661: Initialzing renderers with state as param (closes #22)
- 5b7f353: Renderers now have an optional `meta` field
- 5b7f353: Renderer decorators (closes #23)
- 1d61a0e: Support multiple renderers of a viewer

## 0.3.3

### Patch Changes

- 4d46793: Loading DASH vocabulary lazily to reduce bundle size

## 0.3.2

### Patch Changes

- 7473589: `RoadshowView` could not have been used to dispatch events
- a24fb73: Add state to specific renderer instance
- 4e4d138: Optional renderer initialisation functions

## 0.3.1

### Patch Changes

- 4d20302: rdfine extensions were not exported and thus not visible
- 83327ac: Make it possible to access parent state

## 0.3.0

### Minor Changes

- abefa91: Redesign the state and rendering process

### Patch Changes

- c3ec710: Ability to select multi-viewer to render multiple properties

## 0.2.3

### Patch Changes

- f77a9c9: Re-export lit
- 80d6212: Missing export of `LocalState`

## 0.2.2

### Patch Changes

- 0d1d689: PropertyShape woould not be stored to state
- 2c59f97: Prevent dereference loop if it had failed

## 0.2.1

### Patch Changes

- 526c463: Experimental: preselecting NodeShape viewer with dash:viewer
- baacc95: Setting renderes property did not add them to controller
- 9f3e9ae: Relax type for resource and shape loaders

## 0.2.0

### Minor Changes

- 98294b2: Minimal support for `dash:MultiViewer`
- 1272ffb: Keep proper state of rendered objects

### Patch Changes

- 4872423: Display `rdfs:label` for rendered links
- bc1b7c6: Added params to view
- 647a92a: Refresh rendering when view's `resource` property changes
- 9cd5d66: Render fallback content in slots
- 02b7ce7: Add loading capability to shapes controller

## 0.1.0

### Minor Changes

- 92c2f9a: Rewrite with lit@2 using `ReactiveControllers`
- 3cc1e54: DASH Viewer matching functions

### Patch Changes

- d72e1e5: `dash:DetailsViewer` - do not render hidden properties
- f2f3c41: Resource never undefined when passed to `Viewer`

## 0.0.2

### Patch Changes

- 248898f: Refactor based on first experiences

## 0.0.1

### Patch Changes

- e405c95: First draft
