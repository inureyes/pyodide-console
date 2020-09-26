import {css} from 'lit-element';

export const CodemirrorThemeElegant = css`

.cm-s-elegant span.cm-number, .cm-s-elegant span.cm-string, .cm-s-elegant span.cm-atom { color: #762; }
.cm-s-elegant span.cm-comment { color: #262; font-style: italic; line-height: 1em; }
.cm-s-elegant span.cm-meta { color: #555; font-style: italic; line-height: 1em; }
.cm-s-elegant span.cm-variable { color: black; }
.cm-s-elegant span.cm-variable-2 { color: #b11; }
.cm-s-elegant span.cm-qualifier { color: #555; }
.cm-s-elegant span.cm-keyword { color: #730; }
.cm-s-elegant span.cm-builtin { color: #30a; }
.cm-s-elegant span.cm-link { color: #762; }
.cm-s-elegant span.cm-error { background-color: #fdd; }

.cm-s-elegant .CodeMirror-activeline-background { background: #e8f2ff; }
.cm-s-elegant .CodeMirror-matchingbracket { outline:1px solid grey; color:black !important; }
`;
