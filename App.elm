import Html exposing (..)
import HttpBuilder exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode exposing (..)
import Debug exposing (..)

-- MODEL
type alias Model =
  { startTime : String
  , endTime : String
  }

init : (Model, Cmd Msg)
init =
  ( Model "" ""
  , getOperatingHoursDetails
  )

-- UPDATE
type Msg
  = RefreshOperatingHours
  | UpdateOperatingHours
  | ReceiveOperatingHoursDetails (Result Http.Error JsonResponse)
  | ReceiveUpdatedOperatingHoursDetails (Result Http.Error JsonResponse)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    RefreshOperatingHours ->
      (model, getOperatingHoursDetails)

    UpdateOperatingHours ->
      (model, updateOperatingHoursDetails model)

    ReceiveOperatingHoursDetails (Ok jsonResponse) ->
      Debug.log (jsonResponse |> toString)
      ( Model
         (Maybe.withDefault "" jsonResponse.start_time)
         (Maybe.withDefault "" jsonResponse.end_time)
      , Cmd.none)

    ReceiveOperatingHoursDetails (Err err) ->
      Debug.log (toString err)
      (model, Cmd.none)

    ReceiveUpdatedOperatingHoursDetails (Ok jsonResponse) ->
      Debug.log (jsonResponse |> toString)
      ( Model
         (Maybe.withDefault "" jsonResponse.start_time)
         (Maybe.withDefault "" jsonResponse.end_time)
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
    , input [ id "end_time", type_ "text", value model.endTime ] []
    , input [ id "start_time", type_ "text", value model.startTime ] []
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
  HttpBuilder.put "//localhost:5000/operating_hours"
    |> withUrlEncodedBody [ ("start_time", model.startTime)
                          , ("end_time", model.endTime) ]
    |> withExpect (Http.expectJson decodeJsonOperationHoursResponse)
    |> send ReceiveUpdatedOperatingHoursDetails

getOperatingHoursDetails : Cmd Msg
getOperatingHoursDetails =
  let
    url =
      "//localhost:5000/operating_hours"
  in
    Http.send ReceiveOperatingHoursDetails (Http.get url decodeJsonOperationHoursResponse)

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
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

