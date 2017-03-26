import Html exposing (..)
import HttpBuilder exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode exposing (..)
import Debug exposing (..)

-- CONFIG
type alias Flags =
  { serverUrl : Maybe String
  }

-- MODEL
type alias Model =
  { startTime : String
  , endTime : String
  , serverUrl : String
  }

init : Flags -> (Model, Cmd Msg)
init flags =
  ( Model "" "" ((Maybe.withDefault "" flags.serverUrl) ++ "/operating_hours")
  , getOperatingHoursDetails (Model "" "" ((Maybe.withDefault "" flags.serverUrl) ++ "/operating_hours"))
  )

-- UPDATE
type Msg
  = RefreshOperatingHours
  | UpdateOperatingHours
  | UpdateStartTime String
  | UpdateEndTime String
  | ReceiveOperatingHoursDetails (Result Http.Error JsonResponse)
  | ReceiveUpdatedOperatingHoursDetails (Result Http.Error JsonResponse)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    RefreshOperatingHours ->
      (model, getOperatingHoursDetails model)

    UpdateOperatingHours ->
      (model, updateOperatingHoursDetails model)

    ReceiveOperatingHoursDetails (Ok jsonResponse) ->
      Debug.log (jsonResponse |> toString)
      ( { model |
            startTime = (Maybe.withDefault "" jsonResponse.start_time),
            endTime = (Maybe.withDefault "" jsonResponse.end_time)
        }
      , Cmd.none)

    UpdateStartTime newStartTime ->
      { model | startTime = newStartTime }
         ! []

    UpdateEndTime newEndTime ->
      { model | endTime = newEndTime }
         ! []

    ReceiveOperatingHoursDetails (Err err) ->
      Debug.log (toString err)
      (model, Cmd.none)

    ReceiveUpdatedOperatingHoursDetails (Ok jsonResponse) ->
      Debug.log (jsonResponse |> toString)
      ( { model |
            startTime = (Maybe.withDefault "" jsonResponse.start_time),
            endTime = (Maybe.withDefault "" jsonResponse.end_time)
        }
      , Cmd.none)

    ReceiveUpdatedOperatingHoursDetails (Err err) ->
      Debug.log (toString err)
      (model, Cmd.none)


-- VIEW
view : Model -> Html Msg
view model =
  div []
    [ h2 [] [text "Operating Hours"]
    , button [ onClick RefreshOperatingHours ] [ text "Refresh" ]
    , br [] []
    , input [ id "end_time", type_ "text", Html.Attributes.value model.endTime, onInput UpdateEndTime ] []
    , input [ id "start_time", type_ "text", Html.Attributes.value model.startTime, onInput UpdateStartTime ] []
    , button [ onClick UpdateOperatingHours ] [ text "Update" ]
    , br [] []
    , p [] [text model.startTime]
    , p [] [text model.endTime]
    ]

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-- HTTP

updateOperatingHoursDetails : Model -> Cmd Msg
updateOperatingHoursDetails model =
  HttpBuilder.put model.serverUrl
    |> withUrlEncodedBody [ ("start_time", model.startTime)
                          , ("end_time", model.endTime) ]
    |> withExpect (Http.expectJson decodeJsonOperationHoursResponse)
    |> send ReceiveUpdatedOperatingHoursDetails

getOperatingHoursDetails : Model -> Cmd Msg
getOperatingHoursDetails model =
  Http.send ReceiveOperatingHoursDetails (Http.get model.serverUrl decodeJsonOperationHoursResponse)

type alias JsonResponse =
  { start_time : Maybe String
  , end_time : Maybe String
  }

decodeJsonOperationHoursResponse : Decoder JsonResponse
decodeJsonOperationHoursResponse =
  map2 JsonResponse
    (field "start_time" (maybe string))
    (field "end_time" (maybe string))

main =
  Html.programWithFlags
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

