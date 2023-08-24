import { createActions, handleActions} from 'redux-actions';

const initialState = [];

export const GET_MEMBER = 'member/GET_MEMBER';


const actions = createActions({
    [GET_MEMBER]: () => {}
});

const TreeReduccer = handleActions(
    {
        [GET_MEMBER]: (state, {payload}) => {
            return payload;
        }
    },
    initialState  
);

export default TreeReduccer;