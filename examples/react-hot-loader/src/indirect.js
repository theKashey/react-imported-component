import React from 'react'
import importedComponent from 'react-imported-component'
import Counter from './Counter'

const DefaultLoading = () => <Counter />;

export const makeSplitPoint = fn => importedComponent(fn, {LoadingComponent: DefaultLoading})