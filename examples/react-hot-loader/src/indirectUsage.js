import React from 'react';
import {makeSplitPoint} from './indirect'

const AsyncComponent = makeSplitPoint(() => import('./indirectTarget'))

export default () => <AsyncComponent/>;