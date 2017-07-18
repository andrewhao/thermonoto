module Reactor exposing (..)

import App exposing (..)
import Html


main : Program Never Model Msg
main =
    Html.program
        { init = init (Flags (Just "http://localhost:5000"))
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
