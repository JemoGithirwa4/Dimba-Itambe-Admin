$(document).ready(function () {
    $("#searchInputFix").on("keyup", function () {
        let filter = $(this).val().toLowerCase();

        $("tbody tr").each(function () {
            let homeTeam = $(this).find("td:nth-child(3)").text().toLowerCase().trim(); // Home Team column
            let awayTeam = $(this).find("td:nth-child(4)").text().toLowerCase().trim(); // Away Team column

            if (homeTeam.includes(filter) || awayTeam.includes(filter)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});