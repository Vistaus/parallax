import QtQuick 2.12
import Lomiri.Components 1.3

import "../js/trustPipeline.js" as TrustPipeline

MainView {
    id: root
    width: units.gu(45)
    height: units.gu(75)

    applicationName: "pollux.parallax"

    // Build trust models ONCE
    property var trustModels: TrustPipeline.buildTrustModels()

    PageStack {
        id: stack
        anchors.fill: parent

        Component.onCompleted: {
            var home = stack.push(Qt.resolvedUrl("HomeView.qml"), {
                trustModels: root.trustModels
            })
            // Connect signal from HomeView directly to detail view
            home.requestAppDetail.connect(openAppDetail)
        }

        // Home → App Detail
        function openAppDetail(appModel) {
            stack.push(Qt.resolvedUrl("AppDetailView.qml"), {
                model: appModel
            })
        }
    }
}
